# Changesets

Changesets is a tool to keep record of the changes for a future release. This way we can improve the generation of Release Notes by creating small notes per feature and then grouping them together.

## Changes per feature
Each time a new change is done for a release, a changesets should be created with a summary of the change and a version type (`patch`, `minor`, `major`) depending on what was agreed previously.

To do so, developers should run the following command:

```bash
npx changeset
```
It will be displayed the following options, were it will set the version type of the change.

```
🦋  What kind of change is this for @millicast/sdk? (current version is X.X.X) … 
❯ patch
  minor
  major
```

After selecting the kind of change, it will prompt an input to write the description of the change:

```
🦋  What kind of change is this for @millicast/sdk? (current version is X.X.X) · patch
🦋  Please enter a summary for this change (this will be in the changelogs).
🦋    (submit empty line to open external editor)
🦋  Summary › This is a summary test 
```

Then, a confirmation of the changeset will wait until everything looks good (press `Enter` key or type `Y` and `Enter`):

```
🦋  What kind of change is this for @millicast/sdk? (current version is X.X.X) · patch
🦋  Please enter a summary for this change (this will be in the changelogs).
🦋    (submit empty line to open external editor)
🦋  Summary · This is a summary test
🦋  
🦋  === Summary of changesets ===
🦋  patch:  @millicast/sdk
🦋  
🦋  Is this your desired changeset? (Y/n) › true
```

A new Markdown file will be created in the `./.changesets` folder with a unique name. This then will be used when trying to generate the final changelog.

## Creating CHANGELOG.md
When the code is ready to be released, and the Release Notes to be created, the following command creates the `CHANGELOG.md` file:

```
npx changeset version
```

This will take and remove all the changesets added previously and join them into a `CHANGELOG.md` file in `./packages/millicast-sdk` directory. It will also bump the version number from `./packages/millicast-sdk/package.json`. The terminal will display a success message like this one:

```
🦋  All files have been updated. Review them and commit at your leisure
```