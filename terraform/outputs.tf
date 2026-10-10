output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

output "cosmos_connection_string" {
  value     = azurerm_cosmosdb_account.cosmos.connection_strings[0]
  sensitive = true
}

output "storage_account_name" {
  value = azurerm_storage_account.storage.name
}
