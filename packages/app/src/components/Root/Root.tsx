import React, { PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import { useApp } from '@backstage/core-plugin-api';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
  Link,
  GroupIcon,
  SidebarSubmenu,
  SidebarSubmenuItem,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { MyGroupsSidebarItem } from '@backstage/plugin-org';

// import { RBACSidebarItem } from '@spotify/backstage-plugin-rbac';
import { Administration } from '@janus-idp/backstage-plugin-rbac';


const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={HomeIcon} to="catalog" text="Home">
          <SidebarSubmenu title="Catalog">
            <SidebarSubmenuItem
              title="Domains"
              to="catalog?filters[kind]=domain"
              icon={useApp().getSystemIcon('kind:domain')}
            />
            <SidebarSubmenuItem
              title="Systems"
              to="catalog?filters[kind]=system"
              icon={useApp().getSystemIcon('kind:system')}
            />
            <SidebarSubmenuItem
              title="Components"
              to="catalog?filters[kind]=component"
              icon={useApp().getSystemIcon('kind:component')}
            />
            <SidebarSubmenuItem
              title="APIs"
              to="catalog?filters[kind]=api"
              icon={useApp().getSystemIcon('kind:api')}
            />
            <SidebarDivider />
            <SidebarSubmenuItem
              title="Resources"
              to="catalog?filters[kind]=resource"
              icon={useApp().getSystemIcon('kind:resource')}
            />
            <SidebarDivider />
            <SidebarSubmenuItem
              title="Groups"
              to="catalog?filters[kind]=group"
              icon={useApp().getSystemIcon('kind:group')}
            />
            <SidebarSubmenuItem
              title="Users"
              to="catalog?filters[kind]=user"
              icon={useApp().getSystemIcon('kind:user')}
            />
          </SidebarSubmenu>
        </SidebarItem>
        <MyGroupsSidebarItem
          singularTitle="My Group"
          pluralTitle="My Groups"
          icon={GroupIcon}
        />
        <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
        <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
        <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />
        {/* End global nav */}
        <SidebarDivider />
        <SidebarScrollWrapper>
       
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
      <Administration />
    </Sidebar>
    {children}
  </SidebarPage>
);
