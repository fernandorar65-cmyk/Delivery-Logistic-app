import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeroIconComponent } from '../../../components/hero-icon/hero-icon';

// Interfaces para los datos mock
interface Ally {
  id: string;
  name: string;
  logo?: string;
  initials?: string;
  status: 'active' | 'inactive' | 'pending';
  trucks: number;
  motorcycles: number;
  drivers: number;
  driverAvatars?: string[];
  zone: string;
  rating: number | null;
}

interface StatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-ally-list-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HeroIconComponent],
  templateUrl: './ally-list-view.component.html',
  styleUrl: './ally-list-view.component.css'
})
export class AllyListViewComponent {
  // Datos mock para las tarjetas de estadísticas
  stats = signal<StatCard[]>([
    {
      label: 'Total Aliados',
      value: 45,
      subtitle: '+2 este mes',
      trend: 'up',
      icon: 'hexagon',
      iconColor: 'blue'
    },
    {
      label: 'Vehículos Disp.',
      value: 120,
      subtitle: 'de 145 totales',
      icon: 'truck',
      iconColor: 'emerald'
    },
    {
      label: 'Conductores',
      value: 89,
      subtitle: 'Activos hoy',
      icon: 'user',
      iconColor: 'purple'
    },
    {
      label: 'En Ruta',
      value: 34,
      subtitle: 'Alta demanda',
      icon: 'map-pin',
      iconColor: 'orange'
    }
  ]);

  // Datos mock para los aliados
  allies = signal<Ally[]>([
    {
      id: 'ALY-8902',
      name: 'TransAndina Logística',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe74-_jjsuoc47ysevg43jHVg-dDFtlzVbTl4vqK-i83s5bdgTxKmmHA_GN34GS1PReJIizg1M2v79wGLCYZiS5CfIJN67D_U9_FUcQSHP4igUoXKOy8zvk9_WK8OlPHmDYeqcYPmdpI2_-ySRxd4cc4ly1TvHDAwKqoQUq4puimxhDf9BokZC8TreqFLO-qCPZkVcB6KkgTLsxZjH7noCB8fSGiqUG-K138frWPCwuw6sYPEUncJSTfSaQEI-FQqxIHotRntu4whv',
      status: 'active',
      trucks: 12,
      motorcycles: 5,
      drivers: 15,
      driverAvatars: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDELxPvO_aTCNTt65ZEHWvli8yZu_mx9Lf0dTEAkiZPBUoOhOtGFJKndZSIHfI854-JvU_sUVHsW1d2cvAco4G0iyO2va9XWKMfaJJsr6A-JI7MSTQfee73KPtOpG7lOYGJCHBTIwAslLhLBMtDm9PenQP-FCWuvdJ4RjkBzem_-Ha_YHGMgFDyhO1DN8IJyem2NlJ06BLn5sRrB2yiUzD0ANh_BKn7gbWxgC37iR23c0PcStH3vjg2SGlrfjJXjmSrOwYPRdVejaw9',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA2KT-vTihtxUq1gdi96xFinHzqH2eEffnRLfu0zRLpjpO4bKjDkpfH6mBmGLv1x9e_gIYkMIw-T7OEHDu2OYlFrt5eHJEJAICcwMJDog5UKtGKkuJJdN2Qjtv7ZiXBg4jWL61PwX6e4gylbeVHgh_3wDNuK-m00QPo-dVn7v0w_Pfjq2w6LKItI0-IPvf7CSEhsL__eOA33WNLt3MC61vM07sOnUkZNXSiuzxoZLMI0_N91cmNmmRZhzyjFO3kQPGcq9Q-E5_cUNJV',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuChRZAvNoYNqCCrABSm88vR6rtrQJfQNFnVWraWDdhHv9kf0G9WJ6PlfuDB0n8Ws_F7A_Zn05WU7e3CiaRZR3mIPtKcuM-7bV5F4D4Y6zZKFODqZUvklTe54GV9dpuutps33eQcgigIlYWIDjSfVctYO2GOqspIGZT-Fh-7fXCfqURCp0zRgiGmlNTvarKBBBrEe0UmwPZRvAQ2g1LQDUgIZE1kXb0vj6ftO3LwfhygNhqIDbOfh8KcPpRQvkimW3Vp7qylAkvb8i_2'
      ],
      zone: 'Bogotá D.C. - Norte',
      rating: 4.8
    },
    {
      id: 'ALY-1123',
      name: 'Rápido Cargo',
      initials: 'RC',
      status: 'inactive',
      trucks: 5,
      motorcycles: 0,
      drivers: 5,
      zone: 'Medellín - Area Metro',
      rating: 3.5
    },
    {
      id: 'ALY-5561',
      name: 'InterVial S.A.',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtNUvtHGCJS317qOgZLVTofO1ZB0LRXNLgBj2sWghZF2JvYbUPTWipD5uMcig2JvPk0ZNn5WLo-fZe3tBKXVC2iK5hcRDxK4KTcITDZVrGssZUTjmFUaIOhUQekUnkvNJ-eWSn7Wk-mRcIvlpeYjxAPdMPasjtHyXTf3BDMZK_YGx8M9MylSDKKAKEd2VtQ6BgDBXRYH27-vJv1RnzPqI4jQr-bHv6UsU4q7AvqbP0QmkISQx_nXDgB_tOPqeL0e6cf_jT1J8XJd5Z',
      status: 'active',
      trucks: 20,
      motorcycles: 15,
      drivers: 35,
      driverAvatars: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBB3kr88UkEOx64JUyopsuGSjsDwgSywTFpj05-h4lbs0_dhFHuESd1rnth2NFJum1R8p-ETNciZUPkGv4MBdBFLRmK0q8qurAyg35EF-APbd6JOONlCIwSh7_CtSiKzfdy1MieKh67wWJiE8W3vbpr9TyGTNGNrSlmUJw4xTEuPUbLy9MzUdeozs5Vk9_in2YHczIbCPnl_rHQRcwHenb9V4e4-WZ_eIJc3KDKr870Oa5NNPkc9YKCHDU-A4HqbdQhGlnyaQ8VxcKp',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuADmWJVXgwzzk-iUQde360Yh4J-xqJuBYdWMt_jw0ALUFPH_czDqEipKRX6NnKgLtjcJ7tykAkWnO_cFwIulDJPJpSKCr7IrPK9unfH9xOszwmTr-Y8Bvc4tT-khMQRqeqNgaaIaXB4sDqgFdHJEvcIYLP5p66D_VN7wqf3vmCvolooXHEnJzWDXK9Hf1nTmJUAvN5OYsNnm-KLMnZQo9feX0zcQx8oc5vZjPAy3slhcwWTmpiI2jLc_urfgNOjpe5fUFVBHkrnY-_F'
      ],
      zone: 'Cundinamarca (Occidente)',
      rating: 4.9
    },
    {
      id: 'ALY-3321',
      name: 'Transportes Express',
      initials: 'TE',
      status: 'pending',
      trucks: 2,
      motorcycles: 8,
      drivers: 10,
      zone: 'Cali - Sur',
      rating: null
    },
    {
      id: 'ALY-9982',
      name: 'LogiTech Solutions',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUbkRPfHLZUzjQ5Cz8t9QfiU0tKqa7t37NY5zKWLNBp5K2AznUncJT8n8p-vUGatLJXV4w8oOYTJolPxt-Yi2xs1WGTFN2MDCIO0GiOUyK63N_XDmYA4qsPhLsjkL3bODNkn4KKUdJRLfEjUzb5LV4wLsJqBulhMqwdrWXBu1uoOXYbmSq_23JwrrkCok_vEt_Ehirl7vz1NsVpxO_mzKMBOuZP7I2ZxOO0VJ1iUK9xDvVNSL43sY9ES6NvlKE_xG4ZSXJv7QC1R0g',
      status: 'active',
      trucks: 8,
      motorcycles: 0,
      drivers: 8,
      driverAvatars: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCKDC9tKgxHaYx3pI1Y8qmEH-K8Iu0czmLpW3RP_RLgNAGodZuD1fvzQopGx0Jut6lZltatfQPDXQ89rdJmWDDyqNFKXQjp7F9KX8gyA8XMvooVxFjbEBRdEjP8QhXSdGl5fGKdjsKWavWbxozcoORX47sVuuQ9bj2EcYRuLgvSIjN8q-dIi0pZsWCBIRHgsgh0aCLdvofdGS868pPhvCWh476FRpnNYm3k0nbkrqOTMggXKbTBqBknWb-k01_Vm6ByiOD6adyJk3CD'
      ],
      zone: 'Nacional',
      rating: 4.2
    }
  ]);

  // Estado de búsqueda y filtros
  searchQuery = signal<string>('');
  currentPage = signal(1);
  totalItems = signal(45);
  itemsPerPage = 5;

  // Métodos para la paginación
  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage() * this.itemsPerPage, this.totalItems());
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  // Método para obtener el estado del aliado
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  }
}
