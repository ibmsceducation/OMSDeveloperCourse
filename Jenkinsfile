pipeline {
  agent {
    node {
      label 'Build Environment'
    }

  }
  stages {
    stage('Build om-build machine') {
      steps {
        sh '''docker build /home/demo/customize/Dockerfile om-build && \\
docker run -v /var/run/docker.sock:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-build om-build
'''
      }
    }
  }
}