FROM mycluster.icp:8500/default/om-base:ent-10.0.0.2

RUN sudo yum -y update && \
sudo yum -y install unzip curl && \
sudo yum -y install yum-utils device-mapper-persistent-data lvm2

RUN sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo && \
sudo yum -y install docker-ce
USER root
RUN curl -kLo cloudctl https://172.16.1.1:8443/api/cli/cloudctl-linux-amd64 && \
curl -kLo kubectl https://172.16.1.1:8443/api/cli/kubectl-linux-amd64 && \
curl -kLo helm-linux-amd64.tar.gz https://172.16.1.1:8443/api/cli/helm-linux-amd64.tar.gz  && \
sudo mv ./cloudctl /usr/local/bin/cloudctl && \
sudo chmod 755 /usr/local/bin/cloudctl && \
sudo mv ./kubectl /usr/local/bin/kubectl && \
sudo chmod 755 /usr/local/bin/kubectl

RUN cloudctl login -a https://172.16.1.1:8443 --skip-ssl-validation -u admin -p admin -c id-mycluster-account -n default

RUN tar xzf helm-linux-amd64.tar.gz && \
sudo mv linux-amd64/helm /usr/local/bin/helm && \
sudo chmod 755 /usr/local/bin/helm && \
cd /root && \
helm init --client-only && \
helm version --tls
