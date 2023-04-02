{{/*
Expand the name of the chart.
*/}}
{{- define "mlaide.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "mlaide.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "mlaide.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/****************
Webserver templates
****************/}}

{{/*
Common labels
*/}}
{{- define "mlaide.webserver.labels" -}}
helm.sh/chart: {{ include "mlaide.chart" . }}
{{ include "mlaide.webserver.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "mlaide.webserver.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mlaide.name" . }}-webserver
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "mlaide.webserver.serviceAccountName" -}}
{{- if .Values.webserver.serviceAccount.create }}
{{- default (include "mlaide.fullname" .) .Values.webserver.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.webserver.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*********
UI templates
*********/}}

{{/*
Common labels
*/}}
{{- define "mlaide.ui.labels" -}}
helm.sh/chart: {{ include "mlaide.chart" . }}
{{ include "mlaide.ui.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "mlaide.ui.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mlaide.name" . }}-ui
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "mlaide.ui.serviceAccountName" -}}
{{- if .Values.ui.serviceAccount.create }}
{{- default (include "mlaide.fullname" .) .Values.ui.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.ui.serviceAccount.name }}
{{- end }}
{{- end }}
