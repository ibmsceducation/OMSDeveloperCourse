pipeline {
  agent {
    docker {
      image 'mycluster.icp:8500/default/om-base:ent-10.0.0.2'
      args '-v /var/run/docker.sock:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-base'
    }

  }
  stages {
    stage('Docker Version') {
      steps {
        sh '''sudo yum -y update && \\
sudo yum -y install unzip && \\
sudo yum -y install yum-utils device-mapper-persistent-data lvm2 && \\
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo && \\
sudo yum -y install docker-ce
'''
        sh 'docker ps'
      }
    }
  }
}