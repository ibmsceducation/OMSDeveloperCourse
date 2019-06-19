FROM mycluster.icp:8500/default/om-base:ent-10.0.0.2

RUN sudo yum -y update && \
sudo yum -y install unzip && \
sudo yum -y install yum-utils device-mapper-persistent-data lvm2

RUN sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo && \
sudo yum -y install docker-ce
