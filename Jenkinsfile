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
        sh 'mkdir -p /opt/ssfs/shared/lib'
        sh 'cp /opt/ssfs/shared/course/workaround/resources/system_overrides.properties /opt/ssfs/runtime/properties/system_overrides.properties'
        sh '/opt/ssfs/runtime/bin/sci_ant.sh -f /opt/ssfs/runtime/devtoolkit/devtoolkit_extensions.xml importfromproject -Dprojectdir=/opt/ssfs/shared'
      }
    }
    stage('Build Environment') {
      steps {
        sh '/opt/ssfs/runtime/docker-samples/imagebuild/generateImages.sh --OM_TAG=extn_${BUILD_NUMBER}'
      }
    }
    stage('Tag and Push') {
      steps {
        sh 'docker tag om-app:extn_${BUILD_NUMBER} mycluster.icp:8500/default/om-app:extn_${BUILD_NUMBER}'
        sh 'docker tag om-agent:extn_${BUILD_NUMBER} mycluster.icp:8500/default/om-agent:extn_${BUILD_NUMBER}'
        sh 'docker login -u admin -p admin mycluster.icp:8500 && docker push om-app:extn_${BUILD_NUMBER} mycluster.icp:8500/default/om-app:extn_${BUILD_NUMBER} && docker push om-agent:extn_${BUILD_NUMBER} mycluster.icp:8500/default/om-agent:extn_${BUILD_NUMBER}''
      }
    }
    stage('Update Helm') {
      agent {
        label 'master'
        customWorkspace '${WORKSPACE}/course/helmcharts'
      }
      steps {
         
      }
    }
    stage('CDT') {
      steps {
        sh '/opt/ssfs/runtime/bin/cdtshell.sh -Source DEFAULTXMLDB -Target SYSTEMDB -DefaultXMLDir /opt/ssfs/shared/cdt'
      }
    }
  }
}
