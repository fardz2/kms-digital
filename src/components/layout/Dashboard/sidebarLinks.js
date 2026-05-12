import { BsPersonLinesFill, BsTextRight, BsFileBarGraph } from 'react-icons/bs';
import { FaPaperPlane } from 'react-icons/fa';
export const sidebarlink = [
    {
        title: 'Input Data',
        links: [
            {
                title: 'Desa',
                path: 'desa',
                icon: BsTextRight,
            },
            {
                title: 'Posyandu',
                path: 'posyandu',
                icon: BsTextRight,
            },
            {
                title: 'Artikel',
                path: 'artikel',
                icon: FaPaperPlane,
            }
        ],
    },
    {
        title: 'Register Akun',
        links: [
            {
                title: 'Kader Posyandu',
                path: 'kader-posyandu',
                icon: BsPersonLinesFill,
            },
            {
                title: 'Tenaga Kesehatan',
                path: 'tenaga-kesehatan',
                icon: BsPersonLinesFill,
            },
        ],
    },
    {
        title: 'Laporan',
        links: [
            {
                title: 'Laporan Keseluruhan',
                path: 'laporan',
                icon: BsFileBarGraph,
            },
        ],
    },

];
