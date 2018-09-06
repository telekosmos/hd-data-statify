GET_CONFIG=$(shell node -p "require('./package.json').$(1) || ''")
GET_CONFIG_BOOL=$(shell node -p "!!require('./package.json').$(1)")

STACK=$(call GET_CONFIG,config.stack)
SERVICE=$(call GET_CONFIG,name)
SERVICE_PORT=$(call GET_CONFIG,config.port)
SERVICE_MEMORY:=$(call GET_CONFIG,config.memory)
HAS_ASSETS=$(call GET_CONFIG_BOOL,scripts['build:push'])

BASE_IMAGE=$(shell head -n 1 ./Dockerfile | awk  '{print $$2}')
REGISTRY_HOSTNAME?=docker-registry.tescloud.com
REGISTRY_REPOSITORY?=tescloud
IMAGE_FQN=$(REGISTRY_HOSTNAME)/$(REGISTRY_REPOSITORY)/$(SERVICE)
DOCKER_TEST_NAME=$(SERVICE)-test

GIT_COMMIT_HASH=$(shell git rev-parse HEAD)
GIT_COMMIT_SHORT=$(shell git rev-parse --short HEAD)

JENKINS_BUILD_NUMBER=$(PROMOTED_NUMBER)
ifndef PROMOTED_NUMBER
JENKINS_BUILD_NUMBER=$(BUILD_NUMBER)
endif
ifndef BUILD_NUMBER
JENKINS_BUILD_NUMBER=local
endif
ifndef TSL_ENV
TSL_ENV=local
endif

ifdef SERVICE_MEMORY
SERVICE_MEMORY_ARG:="--service_memory $(SERVICE_MEMORY)"
else
SERVICE_MEMORY_ARG:=
endif

ifeq ($(JENKINS_BUILD_NUMBER),local)
IMAGE_TAG=local
else
IMAGE_TAG=$(GIT_COMMIT_SHORT)
endif

ifeq ($(shell uname),Darwin)
# Docker v1.11+
GET_HOST_IP="docker network inspect bridge | grep -E '\"Gateway\": \"' | grep -Eo '([0-9]*\.){3}[0-9]*'"
DOCKER_TTY=-it
else
# Docker v1.10
GET_HOST_IP="ip route | grep -E docker0 | cut -d ' ' -f 12"
endif
HOST_IP=$(shell eval "$(GET_HOST_IP)")
HOST_NAME=local.tescloud.com

bold=$(shell tput bold)
colour=$(shell tput setaf 2)
reset=$(shell tput sgr0)

info:
	@echo '$(bold)$(colour)Configuration$(reset)'
	@echo '  SERVICE: $(SERVICE)'
	@echo '  SERVICE_PORT: $(SERVICE_PORT)'
ifdef SERVICE_MEMORY
	@echo '  SERVICE_MEMORY: $(SERVICE_MEMORY)'
else
	@echo '  SERVICE_MEMORY: default'
endif
	@echo '  STACK: $(STACK)'
	@echo '  TSL_ENV: $(TSL_ENV)'
	@echo '  BUILD_NUMBER: $(JENKINS_BUILD_NUMBER)'
	@echo '  GIT_COMMIT: $(GIT_COMMIT_SHORT)'
	@echo '  IMAGE_FQN: $(IMAGE_FQN)'
	@echo '  BASE_IMAGE: $(BASE_IMAGE)'
	@echo '  HAS_ASSETS: $(HAS_ASSETS)'

update-base-image:
	@echo '$(colour)Updating Docker base image: $(bold)$(BASE_IMAGE)$(reset)'
	docker pull $(BASE_IMAGE)

manifest:
	@echo '$(colour)Updating manifest.json$(reset)'
	@echo '{"service":"$(SERVICE)","build":"$(JENKINS_BUILD_NUMBER)","commit":"$(GIT_COMMIT_HASH)"}' > manifest.json

build-docker-image: info update-base-image manifest
	@echo '$(colour)Building Docker image: $(bold)$(IMAGE_FQN):$(IMAGE_TAG)$(reset)'
	@echo '$(shell docker --version)'
	docker build --tag $(IMAGE_FQN):$(IMAGE_TAG) .

push-assets: info build-docker-image
ifeq ($(HAS_ASSETS),true)
	@echo '$(colour)Pushing assets: $(bold)$(IMAGE_FQN):$(JENKINS_BUILD_NUMBER)$(reset)'
ifeq (,$(wildcard $(HOME)/.config/bosco/bosco.json))
	$(error '$(colour)bosco configuration file not found$(reset)')
endif
	docker run $(DOCKER_TTY) --name $(SERVICE) --env TSL_ENV=$(TSL_ENV) --env BUILD_NUMBER=$(JENKINS_BUILD_NUMBER) \
		-v $(HOME)/.config/bosco/bosco.json:/root/.config/bosco/bosco.json:ro \
		--rm --entrypoint /usr/bin/npm $(IMAGE_FQN):$(IMAGE_TAG) run build:push
endif

publish-docker-image: info build-docker-image
ifneq ($(JENKINS_BUILD_NUMBER),local)
	@echo '$(colour)Publishing Docker image: $(bold)$(IMAGE_FQN):$(IMAGE_TAG)$(reset)'
	docker tag $(IMAGE_FQN):$(IMAGE_TAG) $(IMAGE_FQN):latest
	docker tag $(IMAGE_FQN):$(IMAGE_TAG) $(IMAGE_FQN):$(JENKINS_BUILD_NUMBER)
	docker tag $(IMAGE_FQN):$(IMAGE_TAG) $(IMAGE_FQN):$(IMAGE_TAG)-$(JENKINS_BUILD_NUMBER)
	docker push $(IMAGE_FQN):$(IMAGE_TAG)
	docker push $(IMAGE_FQN):latest
	docker push $(IMAGE_FQN):$(JENKINS_BUILD_NUMBER)
	docker push $(IMAGE_FQN):$(IMAGE_TAG)-$(JENKINS_BUILD_NUMBER)

	@echo '$(colour)Removing old image versions:$(reset)'
	@docker images --no-trunc $(IMAGE_FQN) | tail -n +3 | awk '{ if ($$2 != "<none>") { print $$1":"$$2 } }'
	@docker images --no-trunc $(IMAGE_FQN) | tail -n +3 | awk '{ if ($$2 != "<none>") { print $$1":"$$2 } }' | xargs docker rmi
endif

test: info build-docker-image
	@echo '$(colour)Mapping host in Docker: $(bold)$(HOST_NAME) -> $(HOST_IP)$(reset)'
	@echo '$(colour)Running tests inside Docker container: $(bold)$(DOCKER_TEST_NAME)$(reset)'
	docker rm -f '/$(DOCKER_TEST_NAME)' 2> /dev/null || true
	docker run $(DOCKER_TTY) --name $(DOCKER_TEST_NAME) --env TSL_ENV=$(TSL_ENV) --rm \
		--add-host $(HOST_NAME):$(HOST_IP) \
		--entrypoint npm $(IMAGE_FQN):$(IMAGE_TAG) run test

jenkins: info build-docker-image test push-assets publish-docker-image

deploy: info
	@echo '$(colour)Deploying Docker container: $(bold)$(SERVICE)...$(reset)'
	ssh -o StrictHostKeyChecking=no ansible@deployment.management.tescloud.com \
		"pushd infra-ansible-configuration && ./deploy.py service-microservice \
			$(SERVICE) $(SERVICE_PORT) $(TSL_ENV) $(JENKINS_BUILD_NUMBER) $(STACK) \
			$(SERVICE_MEMORY_ARG) \
			--consistent-service-port"

deploy-secure: info
	@echo '$(colour)Deploying Docker container to Secure: $(bold)$(SERVICE)$(reset)'
	ssh -o StrictHostKeyChecking=no ansible-secure@deployment-secure.management.tescloud.com \
		"pushd infra-ansible-configuration && ./deploy.py service-microservice \
			$(SERVICE) $(SERVICE_PORT) $(TSL_ENV) $(JENKINS_BUILD_NUMBER) $(STACK) \
			$(SERVICE_MEMORY_ARG) \
			--ansible_ssh_user=ansible-secure --consistent-service-port"

.PHONY: info update-base-image manifest build-docker-image push-assets publish-docker-image test jenkins deploy deploy-secure
