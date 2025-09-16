pipeline {
    agent any

    environment {
        IMAGE_NAME = "abismohammad/my-node-ci"
    }

    stages {
        stage('Clone App Repo') {
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
                    // Short Git commit hash for tagging
                    def commitHash = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Building Docker image with tag: ${commitHash}"

                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh """
                          echo $PASS | docker login -u $USER --password-stdin

                          # Build and tag
                          docker build -t docker.io/$IMAGE_NAME:${commitHash} .

                          # Push both tags
                          docker push docker.io/$IMAGE_NAME:${commitHash}
                        """
                    }

                    // Save commitHash for next stage
                    env.COMMIT_HASH = commitHash
                }
            }
        }

        stage('Update Manifests Repo') {
            steps {
                script {
                    dir('manifests-repo') {
                        git branch: 'main',
                            url: 'https://github.com/ABISMOHAMMAD/node-ci-k8s-manifests.git',
                            credentialsId: 'github-creds'

                        sh """
                          # Update image tag in deployment.yaml
                          sed -i 's|image: docker.io/$IMAGE_NAME:.*|image: docker.io/$IMAGE_NAME:${COMMIT_HASH}|' deployment.yaml

                          git config user.email "jenkins@ci"
                          git config user.name "Jenkins"
                          git add deployment.yaml
                          git commit -m "Update image to ${COMMIT_HASH}" || echo "No changes to commit"
                          git push origin main
                        """
                    }
                }
            }
        }
    }
}

