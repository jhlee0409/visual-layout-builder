# Security Advisory: React2Shell Vulnerability Fix

**Date**: 2025-12-17
**CVE**: CVE-2025-55182 (React), CVE-2025-66478 (Next.js)
**Severity**: Critical
**Status**: Patched

## Summary

React2Shell is a critical vulnerability in React Server Components affecting React 19 and frameworks like Next.js. The flaw allows specially crafted requests to lead to unintended remote code execution under certain conditions.

## Affected Versions

### Next.js
- **Affected**: 15.0.0 through 16.0.6
- **Also affected**: Next.js 14 canaries after 14.3.0-canary.76

### Related Packages (if using directly)
- react-server-dom-webpack
- react-server-dom-parcel
- react-server-dom-turbopack

## Visual Layout Builder Project Status

### Before Patch
```json
{
  "next": "^15.0.3",          // ❌ Vulnerable
  "eslint-config-next": "^15.0.3"
}
```

### After Patch
```json
{
  "next": "^15.5.7",          // ✅ Patched
  "eslint-config-next": "^15.5.7"
}
```

## Patched Next.js Versions

The following versions include the security fix:
- 15.0.5
- 15.1.9
- 15.2.6
- 15.3.6
- 15.4.8
- 15.5.7 ← **Selected for this project**
- 16.0.10

## Actions Taken

1. ✅ Updated `next` from `^15.0.3` to `^15.5.7`
2. ✅ Updated `eslint-config-next` from `^15.0.3` to `^15.5.7`
3. ⚠️ **Recommended**: Run `pnpm install` to apply updates
4. ⚠️ **Recommended**: Rotate environment variables if previously exposed

## Post-Update Checklist

After applying this update, complete the following:

- [ ] Run `pnpm install` to update dependencies
- [ ] Run `pnpm build` to verify build still works
- [ ] Run `pnpm test:run` to verify tests pass
- [ ] Run `pnpm dev` to verify development server works
- [ ] Consider rotating sensitive environment variables
- [ ] Review deployment access logs for suspicious activity

## Mitigation for Vercel Deployments

If deployed on Vercel:
- Vercel deployed WAF rules prior to CVE announcement
- Enable Standard Protection for non-production deployments
- Audit shareable links from deployments

## References

- [Vercel Security Bulletin](https://vercel.com/kb/bulletin/react2shell)
- [CVE-2025-55182](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-55182)
- [CVE-2025-66478](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-66478)

## Contact

For questions about this security update, refer to the project maintainers.
