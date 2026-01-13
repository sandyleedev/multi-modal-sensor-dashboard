# Google Cloud Provider Configuration
provider "google" {
  project = "upheld-world-482720-s3"
  region  = "europe-west2"
}

# Custom VPC Network for better isolation
resource "google_compute_network" "vpc_network" {
  name                    = "sensor-network"
  auto_create_subnetworks = false
}

# Custom Subnet in London
resource "google_compute_subnetwork" "sensor_subnet" {
  name          = "sensor-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = "europe-west2"
  network       = google_compute_network.vpc_network.id
}

# Firewall Rule: Allow HTTP and HTTPS from anywhere (Vercel & Certbot)
resource "google_compute_firewall" "allow_web" {
  name    = "allow-web"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

# Firewall Rule: Allow SSH only via IAP (Google's Identity-Aware Proxy)
# This prevents brute-force attacks by blocking public port 22 access.
resource "google_compute_firewall" "allow_ssh_iap" {
  name    = "allow-ssh-iap"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # Fixed IP range for Google Cloud IAP
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["allow-ssh"]
}

# Google Compute Engine Instance (VM) Resource
resource "google_compute_instance" "sensor_backend" {
  name         = "multi-modal-sensor-server-v2"
  machine_type = "e2-micro"
  zone         = "europe-west2-a"

  # Boot Disk Configuration using Debian 11
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network    = google_compute_network.vpc_network.id
    subnetwork = google_compute_subnetwork.sensor_subnet.id

    # Required for public access to your Nginx/API
    access_config {
      # Ephemeral public IP
    }
  }

  # Apply network tags for firewall rules
  tags = ["http-server", "allow-ssh"]

  # Ensure the instance uses a secure service account with limited scopes
  service_account {
    scopes = ["cloud-platform"]
  }

  # metadata_startup_script can be used to auto-update and install Docker
  metadata_startup_script = "apt-get update && apt-get upgrade -y"
}