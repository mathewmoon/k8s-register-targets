This is a service to be run by the k8s metacontroller plugin (https://github.com/GoogleCloudPlatform/metacontroller)

The controller listens for pods with the correct annotations and calls AWS API to register them into target groups by podIp.

Requires AWS credentials and region environment variables set at runtime. And a role that allows registering/deregistering targets. I use kiam for this.
