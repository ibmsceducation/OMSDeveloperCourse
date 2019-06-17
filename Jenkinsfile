pipeline {
  agent {
    dockerfile {
      filename '/home/demo/customize/Dockerfile'
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