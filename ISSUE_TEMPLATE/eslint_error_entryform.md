### ESLint error: Missing dependency in useEffect in EntryForm.js causes CI failure

The CI job failed due to an ESLint error in [EntryForm.js](https://github.com/kmkarakaya/HobbyMap/blob/00ea8c8bc079ebbe8add3f93381af90bbe1e51d6/frontend/src/components/EntryForm.js):

```
Line 57:6:  React Hook useEffect has a missing dependency: 'initialData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
```

**Solution:**  
Update the useEffect at line 29 to include `initialData` in the dependency array:

```js
useEffect(() => {
  // ...logic...
}, [initialData]);
```

See the failing job: https://github.com/kmkarakaya/HobbyMap/actions/runs/18051030211/job/51372793320

Commit reference: 00ea8c8bc079ebbe8add3f93381af90bbe1e51d6.