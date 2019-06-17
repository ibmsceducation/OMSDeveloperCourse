pipeline {
  agent {
    dockerfile {
      filename '/home/demo/customize/Dockerfile'
    }

  }
  stages {
    stage('Docker exec') {
      steps {
        sh 'docker exec -it om-base "docker ps"'
      }
    }
  }
}