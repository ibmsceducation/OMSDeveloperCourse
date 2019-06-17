pipeline {
  agent {
    docker {
      args '-v /var/run/docker.sockk:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-base'
      image 'mycluster.icp:8500/default/om-base:ent-10.0.0.2'
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