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
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    // Get short commit hash
                    def GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Tagging image as ${GIT_COMMIT_SHORT}"

                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh """
                          echo $PASS | docker login -u $USER --password-stdin

                          # Build image with commit hash and latest
                          docker build -t docker.io/$IMAGE_NAME:${GIT_COMMIT_SHORT} -t docker.io/$IMAGE_NAME:latest .

                          # Push both tags
                          docker push docker.io/$IMAGE_NAME:${GIT_COMMIT_SHORT}
                          docker push docker.io/$IMAGE_NAME:latest

                          # Update secret in Kubernetes
                          kubectl delete secret dockerhub-secret -n default --ignore-not-found
                          kubectl create secret docker-registry dockerhub-secret \
                            --docker-server=https://index.docker.io/v1/ \
                            --docker-username=$USER \
                            --docker-password=$PASS \
                            --docker-email=dummy@example.com \
                            -n default
                        """
                    }
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                sh '''
                  kubectl config use-context minikube
                  kubectl apply -f k8s/deployment.yaml
                  kubectl apply -f k8s/service.yaml
                  kubectl rollout status deployment/my-node-app -n default --timeout=60s
                '''
            }
        }
    }
}

