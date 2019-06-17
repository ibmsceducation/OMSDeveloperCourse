pipeline {
  agent {
    docker {
      image 'mycluster.icp:8500/default/om-build:latest'
      args '-v /var/run/docker.sock:/var/run/docker.sock -v ${WORKSPACE}:/opt/ssfs/shared -u root -it'
    }
  }

  stages {
    stage('Install Extensions') {
      steps {
        sh '/opt/ssfs/runtime/bin/sci_ant.sh -f /opt/ssfs/runtime/devtoolkit/devtoolkit_extensions.xml importfromproject -Dprojectdir=/opt/ssfs/shared'
        sh 'cp /opt/ssfs/shared/course/workaround/resources/system_overrides.properties /opt/ssfs/runtime/properties/system_overrides.properties'
      }
    }
    stage('Build Environment') {
      steps {
        sh '/opt/ssfs/runtime/docker-samples/imagebuild/generateImages.sh --OM_TAG=extn_${BUILD_NUMBER}'
        sh 'cp /opt/ssfs/*.tar /opt/ssfs/shared/.'
      }
    }
  }
}
