import React from 'react';
import Modal from '../../components/ui/Modal';
import ChartWHO from '../anak/ChartWHO';

export default function ChartModal({ anak, pengukuran, onClose }) {
  return (
    <Modal
      title={anak?.nama ?? 'Grafik Pertumbuhan'}
      open={!!anak}
      onCancel={onClose}
      footer={null}
      width={760}
    >
      {anak && <ChartWHO anak={anak} pengukuran={pengukuran ?? []} />}
    </Modal>
  );
}
