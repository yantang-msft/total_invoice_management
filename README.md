# total_invoice_managment
### *a Kubernetes tutorial*

Original repo accompanies a [blog post](https://medium.com/@MostlyHarmlessD/getting-started-with-microservices-and-kubernetes-76354312b556). 
This repo contains a modified version that uses Helm for deployment and sends diagnostic data to Application Insights.
One should create an Application Insights resource and have its instrumentation key ready before attempting to deploy the app.

## Configure deployment environment

If using minikube, switch to the built-in Docker daemon:
```
eval $(minikube docker-env)
```
(this affects the current shell only).

## Build Docker images

```
docker build . -f invoices_svc/Dockerfile -t invoices_svc:v1
docker build . -f expected_date_svc/Dockerfile -t expected_date_svc:v1
docker build . -f auth_svc/Dockerfile -t auth_svc:v1
```

## Deploy
```
cd ../kube
helm install total_invoice --name total-invoice-rel  --set 'appinsights_instrumentationkey=<YOUR APP INSIGHS IKEY>'
```

The default Kubernetes namespace to deploy into is `total-invoice`. 
If a different namespace is desired, override the "namespace" value 
(pass `--set 'namespace=other-namespace'` to `helm install`).

## To learn what the entry URL is
```
 minikube service ambassador-svc --url --namespace total-invoice
```

## To interrogate the invoices service
```
curl http://<AMBASSADOR SERVICE URL>/invoices/14 -H 'authorization: letmeinpleasekthxbye'
```
(replace ambassador service URL as necessary).

## To delete the deployment
```
helm del --purge total-invoice-rel
```
