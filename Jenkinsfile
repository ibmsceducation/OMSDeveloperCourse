pipeline {
  agent none
  stages {
    stage('error') {
      steps {
        sh '''docker build /home/demo/customize/Dockerfile om-build
docker run -v /var/run/docker.sock:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-build om-build
'''
      }
    }
  }
}