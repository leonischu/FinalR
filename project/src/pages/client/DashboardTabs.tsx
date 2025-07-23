import React from 'react';
import { useOutletContext } from 'react-router-dom';

interface DashboardContext {
  DashboardTab: React.ComponentType;
  BrowseTab: React.ComponentType;
  BookingsTab: React.ComponentType;
  FavoritesTab: React.ComponentType;
  MessagesTab: React.ComponentType;
  ProfileTab: React.ComponentType;
}

export const DashboardTab = () => {
  const { DashboardTab: Component } = useOutletContext<DashboardContext>();
  return <Component />;
};

export const BrowseTab = () => {
  const { BrowseTab: Component } = useOutletContext<DashboardContext>();
  return <Component />;
};

export const BookingsTab = () => {
  const { BookingsTab: Component } = useOutletContext<DashboardContext>();
  return <Component />;
};

export const FavoritesTab = () => {
  const { FavoritesTab: Component } = useOutletContext<DashboardContext>();
  return <Component />;
};

export const MessagesTab = () => {
  const { MessagesTab: Component } = useOutletContext<DashboardContext>();
  return <Component />;
};

export const ProfileTab = () => {
  const { ProfileTab: Component } = useOutletContext<DashboardContext>();
  return <Component />;
}; 