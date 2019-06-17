pipeline {
  agent {
    dockerfile {
      filename '/home/demo/customize/Dockerfile'
    }

  }
  stages {
    stage('') {
      steps {
        sh '''docker build /home/demo/customize/Dockerfile om-build
docker run -v /var/run/docker.sock:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-build om-build
'''
      }
    }
  }
}