from rest_framework import viewsets


class ViewSetBase(viewsets.ModelViewSet):
    def get_queryset(self):
        return super().get_queryset().filter(eliminado=False)

    def perform_destroy(self, instance):
        instance.eliminar_logicamente()