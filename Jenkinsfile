pipeline {
  agent {
    docker {
      args '-v /var/run/docker.sock:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-base'
      image 'mycluster.icp:8500/default/om-build:latest'
    }

  }
  stages {
    stage('Docker Version') {
      steps {
        sh 'docker ps'
      }
    }
  }
}