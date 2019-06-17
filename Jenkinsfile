pipeline {
  agent {
    docker {
      image 'om-base'
      args '-v /var/run/docker.sockk:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-base'
    }

  }
  stages {
    stage('Build') {
      steps {
        git 'https://github.com/pfaiola/OMSDeveloperCourse.git'
      }
    }
    stage('Docker exec') {
      steps {
        sh 'docker exec -it om-base "docker ps"'
      }
    }
  }
}