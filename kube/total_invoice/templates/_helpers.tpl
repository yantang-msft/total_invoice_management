{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "total_invoice.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "total_invoice.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "total_invoice.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "total_invoice.std.labels" -}}
app: total-invoice
component: {{ .service_name }}
release: {{ .Release.Name }}
{{- end }}

{{/*
Define common, Kubernetes-related environment variables
*/}}
{{- define "total_invoice.k8s.envvars" -}}
- name: SOURCE_CONTAINER_NAME
  value: {{ .service_name }}
- name: POD_NAME
  valueFrom:
    fieldRef:
      fieldPath: metadata.name
- name: NAMESPACE_NAME
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
- name: POD_ID
  valueFrom:
    fieldRef:
      fieldPath: metadata.uid
{{- end }}

{{- define "total_invoice.fluentdSidecar" -}}
- name: fluentdsidecar
  image: {{ .Values.fluentdsidecar_image }}
  imagePullPolicy: IfNotPresent
  env:
    - name: INSTRUMENTATION_KEY
      valueFrom:
        secretKeyRef:
          name: total-invoice-secrets
          key: appinsights_instrumentationkey
{{ include "total_invoice.k8s.envvars" . | indent 4 }}
  volumeMounts:
  - name: varlog
    mountPath: /var/log
  - name: varlibdockercontainers
    mountPath: /var/lib/docker/containers
    readOnly: true
  - name: emptydir
    mountPath: /var/fluentdsidecar
{{- end }}

{{- define "total_invoice.fluentdConsoleLogVolume" -}}
- name: varlog
  hostPath:
    path: /var/log
- name: varlibdockercontainers
  hostPath:
    path: /var/lib/docker/containers
- name: emptydir
  emptyDir: {}
{{- end }}

{{- define "total_invoice.fluentdAuthorizationAssets" -}}
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: {{ .service_name }}
  namespace: {{ .Values.namespace }}
rules:
- apiGroups: [""]
  resources:
  - pods
  - namespaces
  verbs: ["get", "list", "watch"]

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name:  {{ .service_name }}
  namespace: {{ .Values.namespace }}

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name:  {{ .service_name }}
  namespace: {{ .Values.namespace }}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name:  {{ .service_name }}
subjects:
- kind: ServiceAccount
  name:  {{ .service_name }}
  namespace: {{ .Values.namespace }}
{{- end }}
