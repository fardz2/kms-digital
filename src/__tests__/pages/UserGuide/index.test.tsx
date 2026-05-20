import React from 'react';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { guideContent } from '../../../features/user-guide/data/guideContent';
import { UserGuidePage } from '../../../pages/UserGuide';

describe('UserGuidePage', () => {
  test('renders the guide heading, role navigation, role sections, and download link', () => {
    render(
      <MemoryRouter initialEntries={['/user-guide']}>
        <Routes>
          <Route path="/user-guide" element={<UserGuidePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /panduan penggunaan kms digital/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /download pptx/i,
      })
    ).toHaveAttribute('href', '/user-guide/KMS-Digital-User-Guide.pptx');

    guideContent.forEach((role) => {
      expect(screen.getByRole('link', { name: role.title })).toHaveAttribute(
        'href',
        `#role-${role.id.toLowerCase()}`
      );
      expect(screen.getByRole('heading', { name: role.title })).toBeInTheDocument();

      role.sections.forEach((section) => {
        const sectionRoot = document.getElementById(section.id);

        expect(sectionRoot).toBeTruthy();
        expect(within(sectionRoot as HTMLElement).getByRole('heading', { name: section.title })).toBeInTheDocument();
      });
    });
  });
});
