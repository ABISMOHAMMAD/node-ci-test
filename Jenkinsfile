pipeline {
    agent any

    environment {
        IMAGE_NAME = "abismohammad/my-node-ci"
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/ABISMOHAMMAD/node-ci-test.git'
            }
        }


    

        stage('Debug') {
           steps {
               sh 'echo $PATH && which node && node -v && npm -v'
            }
        }

        stage('Install & Test') {
            steps {
                sh '''
                  npm install
                  npm test
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                  docker build -t docker.io/$IMAGE_NAME:$BUILD_NUMBER .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                      echo $PASS | docker login -u $USER --password-stdin
                      docker push docker.io/$IMAGE_NAME:$BUILD_NUMBER
                      docker tag docker.io/$IMAGE_NAME:$BUILD_NUMBER docker.io/$IMAGE_NAME:latest
                      docker push docker.io/$IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                sh '''
                  kubectl config use-context minikube
                  kubectl apply -f k8s/deployment.yaml
                  kubectl apply -f k8s/service.yaml
                  kubectl rollout status deployment/my-node-app -n default
                '''
            }
        }
    }
}

