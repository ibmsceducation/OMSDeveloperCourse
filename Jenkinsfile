pipeline {
  agent {
    docker {
      image 'mycluster.icp:8500/default/om-base:ent-10.0.0.2'
      args '-v /var/run/docker.sock:/var/run/docker.sock -v /home/demo/shared:/opt/ssfs/shared -u root -it --name om-base'
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