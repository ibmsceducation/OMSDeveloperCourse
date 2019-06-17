pipeline {
  agent {
    docker {
      image 'mycluster.icp:8500/default/om-build:latest'
      args '-v /var/run/docker.sock:/var/run/docker.sock -v ${WORKSPACE}:/opt/ssfs/shared -u root -it'
    }
  }

  stages {
    stage('Get current folder') {
      steps {
        sh 'cd /opt && pwd'
        sh 'ls'
        sh 'cd /opt/ssfs && ls'
        sh 'cd /opt/ssfs/shared && ls'
        sh 'docker ps -a'
      }
    }
  }
}
