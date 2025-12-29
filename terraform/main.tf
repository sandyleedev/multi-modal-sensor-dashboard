# Google Cloud Provider Configuration
provider "google" {
  project = "upheld-world-482720-s3"
  region = "us-central1"
}

# Google Compute Engine Instance (VM) Resource
resource "google_compute_instance" "sensor_backend" {
  name         = "multi-modal-sensor-server"
  machine_type = "e2-micro"
  zone         = "us-central1-a"

  # Boot Disk Configuration using Debian 11
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {

    }
  }

  tags = ["http-server"]
}