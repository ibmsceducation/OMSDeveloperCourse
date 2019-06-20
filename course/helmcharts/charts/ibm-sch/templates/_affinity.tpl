{{- /*
`"sch.affinity.nodeAffinity"` constrain your pod to only be able to run on particular nodes
based on specified rules. Specify one or both of nodeAffinityRequiredDuringScheduling and
nodeAffinityPreferredDuringScheduling to set your node affinity.

Charts that support more than one architecture can include the 'arch' parameter in their
values.yaml. Doing so will override the default affinity values specified in
_sch-chart-config.yaml.

For more information, see https://kubernetes.io/docs/concepts/configuration/assign-pod-node/

Note: the 'key' parameter in the config values map is optional and will default to 'beta.kubernetes.io/arch'
if not specified.

__Config Values Used:__
- passed as argument

__Parameters input as an list of values:__
- the root context (required)
- config values map of annotations (required)

__Usage:__
example chart config values. See _config.tpl for the default values if you do not define sch.chart.nodeAffinity
```
{{- define "sch.chart.nodeAffinity" -}}
sch:
  chart:
    nodeAffinity:
      nodeAffinityRequiredDuringScheduling:
        key: beta.kubernetes.io/arch
        operator: In
        values:
          - amd64
          - ppc64le
          - s390x
      nodeAffinityPreferredDuringScheduling:
        amd64:
          key: beta.kubernetes.io/arch
          operator: In
          weight: 3
{{- end -}}
```
used in template as follows:
```
      annotations:
{{- include "sch.affinity.nodeAffinity" (list .) | indent 8 }}
```
{{/* affinity - https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ */}}
*/}}

{{- define "sch.affinity.nodeAffinity" -}}
  {{- $params := . }}
  {{- $root := first $params }}
  {{- $defaultRoot := fromYaml (include "sch.chart.default.config.values" .) }}
  {{- $defaultNodeAffinity := $defaultRoot.sch.chart.nodeAffinity }}
  {{- $nodeAffinity := $root.sch.chart.nodeAffinity | default $defaultNodeAffinity }}
nodeAffinity:
  {{- if (gt (len $nodeAffinity) 0) -}}
    {{- if or (hasKey $nodeAffinity "nodeAffinityRequiredDuringScheduling") (hasKey $root.Values "arch")}}
  {{ include "sch.affinity.nodeAffinityRequiredDuringScheduling" (list $root $nodeAffinity) }}
    {{- end }}
    {{- if or (hasKey $nodeAffinity "nodeAffinityPreferredDuringScheduling") (hasKey $root.Values "arch") }}
  {{ include "sch.affinity.nodeAffinityPreferredDuringScheduling" (list $root $nodeAffinity) | indent 2 }}
    {{- end }}
  {{- end }}
{{- end }}

{{- define "sch.affinity.nodeAffinityRequiredDuringScheduling" -}}
    {{- $params := . }}
    {{- $root := first $params }}
    {{- $affinity := last $params -}}
    {{- $operator := $affinity.nodeAffinityRequiredDuringScheduling.operator -}}
    {{- $values := $affinity.nodeAffinityRequiredDuringScheduling.values -}}
requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
    - matchExpressions:
      - key: {{ default "beta.kubernetes.io/arch" $affinity.key }}
        operator: {{ $operator }}
        values:
    {{- if $root.Values.arch -}}
      {{- $archType := typeOf $root.Values.arch -}}
      {{- if eq $archType "map[string]interface {}" -}}
        {{- range $key, $value := $root.Values.arch }}
        - {{ $key }}
        {{- end -}}
      {{- else }}
        - {{ $root.Values.arch }}
      {{- end -}}
    {{- else -}}
    {{- range $key := $values }}
        - {{ $key }}
    {{- end -}}
    {{- end -}}
{{- end }}

{{- define "sch.affinity.nodeAffinityPreferredDuringScheduling" -}}
  {{- $params := . }}
  {{- $root := first $params }}
  {{- $nodeAffinity := last $params -}}
  {{- $affinityDefault := $nodeAffinity.nodeAffinityPreferredDuringScheduling -}}
  {{- $affinity := $root.Values.arch | default $affinityDefault -}}
  {{- if not $root.Values.arch }}
  {{- range $key, $value := $affinity }}
preferredDuringSchedulingIgnoredDuringExecution:
    {{- $weight := $value.weight | int64 }}
    {{- $operator := $value.operator }}
- weight: {{ $weight }}
  preference:
    matchExpressions:
    - key: {{ default "beta.kubernetes.io/arch" $value.key }}
      operator: {{ default "In" $operator }}
      values:
      - {{ $key }}
  {{ end -}}
  {{- else if and ($root.Values.arch) (eq (typeOf $root.Values.arch) "map[string]interface {}") }}
preferredDuringSchedulingIgnoredDuringExecution:
    {{- range $key, $value := $root.Values.arch }}
    {{- $splitValue := split " " $value }}
- weight: {{ $splitValue._0 }}
  preference:
    matchExpressions:
    - key: "beta.kubernetes.io/arch"
      operator: "In"
      values:
      - {{ $key }}
    {{- end -}}
  {{- end }}
{{- end }}
