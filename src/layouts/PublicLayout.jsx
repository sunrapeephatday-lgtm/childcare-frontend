import React from 'react';
import NavBar from '../components/NavBar';

export default function PublicLayout({ children }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
