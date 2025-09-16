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

        stage('Install & Test') {
            agent {
                docker {
                    image 'node:22-alpine'
                }
            }
            steps {
                sh '''
                  node -v
                  npm -v
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

        stage('Push to Docker Hub & Update Secret') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                      # Login to Docker Hub
                      echo $PASS | docker login -u $USER --password-stdin

                      # Push versioned and latest tags
                      docker push docker.io/$IMAGE_NAME:$BUILD_NUMBER
                      docker tag docker.io/$IMAGE_NAME:$BUILD_NUMBER docker.io/$IMAGE_NAME:latest
                      docker push docker.io/$IMAGE_NAME:latest

                      # Create or update Kubernetes imagePullSecret
                      kubectl delete secret dockerhub-secret -n default --ignore-not-found
                      kubectl create secret docker-registry dockerhub-secret \
                        --docker-server=https://index.docker.io/v1/ \
                        --docker-username=$USER \
                        --docker-password=$PASS \
                        --docker-email=dummy@example.com \
                        -n default
                    '''
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                sh '''
                  kubectl config use-context minikube

                  # Apply Kubernetes manifests
                  kubectl apply -f k8s/deployment.yaml
                  kubectl apply -f k8s/service.yaml

                  # Wait for rollout
                  kubectl rollout status deployment/my-node-app -n default --timeout=60s
                '''
            }
        }
    }
}

