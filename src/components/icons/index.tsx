import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CancelCircleIcon,
  Car01Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  ClipboardListIcon,
  DashboardSquare01Icon,
  Flag02Icon,
  FilterHorizontalIcon,
  IdIcon,
  ImageAdd01Icon,
  InformationCircleIcon,
  Loading03Icon,
  Logout01Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Settings01Icon,
  Tick02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { forwardRef, type SVGProps } from 'react';

/**
 * Every icon in the panel comes from here, never from the package directly.
 *
 * That indirection is the whole point: the icon set and its style variant are
 * chosen once, in this file. Swapping the free set for HugeIcons Pro, or
 * stroke-rounded for duotone, is an edit to the import above and nothing else.
 *
 * Icons are re-exported as components rather than raw data so call sites keep
 * the familiar `<CheckIcon className="size-4" />` shape.
 */

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  size?: string | number;
  strokeWidth?: number;
};

function icon(glyph: IconSvgElement, displayName: string) {
  const Component = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <HugeiconsIcon ref={ref} icon={glyph} {...props} />
  ));
  Component.displayName = displayName;
  return Component;
}

// ── Navigation ───────────────────────────────────────────────────────────────
export const DashboardIcon = icon(DashboardSquare01Icon, 'DashboardIcon');
export const VerificationsIcon = icon(CheckmarkBadge01Icon, 'VerificationsIcon');
export const ReportsIcon = icon(Flag02Icon, 'ReportsIcon');
export const UsersIcon = icon(UserGroupIcon, 'UsersIcon');
export const RidesIcon = icon(Car01Icon, 'RidesIcon');
export const ConfigIcon = icon(Settings01Icon, 'ConfigIcon');
export const AuditLogIcon = icon(ClipboardListIcon, 'AuditLogIcon');

// ── Controls ─────────────────────────────────────────────────────────────────
export const CheckIcon = icon(Tick02Icon, 'CheckIcon');
export const CloseIcon = icon(Cancel01Icon, 'CloseIcon');
export const ChevronDownIcon = icon(ArrowDown01Icon, 'ChevronDownIcon');
export const ChevronUpIcon = icon(ArrowUp01Icon, 'ChevronUpIcon');
export const ChevronRightIcon = icon(ArrowRight01Icon, 'ChevronRightIcon');
export const ChevronLeftIcon = icon(ArrowLeft01Icon, 'ChevronLeftIcon');
export const MoreIcon = icon(MoreHorizontalIcon, 'MoreIcon');
export const SearchIcon = icon(Search01Icon, 'SearchIcon');
export const FilterIcon = icon(FilterHorizontalIcon, 'FilterIcon');
export const SpinnerIcon = icon(Loading03Icon, 'SpinnerIcon');
export const SignOutIcon = icon(Logout01Icon, 'SignOutIcon');

// ── Status ───────────────────────────────────────────────────────────────────
export const SuccessIcon = icon(CheckmarkCircle02Icon, 'SuccessIcon');
export const InfoIcon = icon(InformationCircleIcon, 'InfoIcon');
export const WarningIcon = icon(Alert02Icon, 'WarningIcon');
export const ErrorIcon = icon(CancelCircleIcon, 'ErrorIcon');

// ── Domain ───────────────────────────────────────────────────────────────────
export const DocumentIcon = icon(ImageAdd01Icon, 'DocumentIcon');
export const IdCardIcon = icon(IdIcon, 'IdCardIcon');
