pipeline {
  agent {
    docker {
      image 'mycluster.icp:8500/default/om-build:latest'
      args '-v /var/run/docker.sock:/var/run/docker.sock -v ${WORKSPACE}:/opt/ssfs/shared -u root -it --entrypoint=/bin/bash'
      label 'om_build'
    }
  }

  stages {
    stage('Get current folder') {
      steps {
        sh 'pwd'
        sh 'ls'
        sh 'docker ps -a'
      }
    }
  }
}
