# total_invoice_managment
### *a Kubernetes tutorial*

Original repo accompanies a [blog post](https://medium.com/@MostlyHarmlessD/getting-started-with-microservices-and-kubernetes-76354312b556). 
This repo contains a modified version that uses Helm for deployment and enabled Application Insights sdk in the projects.
However no data will be sent to application insights, as the purpose of this demo branch is to have the K8s related configuration injected automatically by the AI [webhook](https://github.com/yantang-msft/kubernetes-appinsights-webhook).
Current you need to deploy the webhook manually, but finally it will be created automatically when you create the AKS cluster and opt in Application Insights.

## Configure deployment environment

If using minikube, switch to the built-in Docker daemon:
```
eval $(minikube docker-env)
```
(this affects the current shell only).

Pull latest fluentd sidecar image for sending logs to Application Insights
```
docker pull atcdemo.azurecr.io/fluentdsidecar:latest
```

If you are deploying to AKS, it's by default RBAC dsiabled. You can remove all RBAC related settings before deployment.
If you created an AKS cluster with RBAC enabled, you need to install tiller through from the following command, [here](https://github.com/helm/helm/issues/3460#issuecomment-385992094) is the detailed discusssion. Otherwise, tiller won't be able to talk to the K8s API server.
```
kubectl delete svc tiller-deploy -n kube-system
kubectl -n kube-system delete deploy tiller-deploy
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
helm init --service-account tiller
helm ls # does not return an error
```

## Build Docker images

```
docker build . -f invoices_svc/Dockerfile -t invoices_svc:v1
docker build . -f expected_date_svc/Dockerfile -t expected_date_svc:v1
docker build . -f auth_svc/Dockerfile -t auth_svc:v1
docker build . -f entry_svc/Dockerfile -t entry_svc:v1
```

## Deploy
```
cd ./kube
helm install total_invoice --name total-invoice-rel
```

NOTICE: Make sure the values are set correctly in values.yaml.  
For example, the default Kubernetes namespace to deploy into is `total-invoice`.
If a different namespace is desired, override the "namespace" value (pass `--set 'namespace=other-namespace'` to `helm install`).  
Also make sure the images are pushed to the registry and can be pulled from your cluster.

## To learn what the entry URL is
```
 minikube service entry-svc --url --namespace total-invoice
```

## To interrogate the invoices service
```
curl http://<ENTRY SERVICE URL>/invoices/14 -H 'authorization: letmeinpleasekthxbye'
```
(replace entry service URL as necessary).

## To delete the deployment
```
helm del --purge total-invoice-rel
```