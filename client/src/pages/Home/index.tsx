import React, { useContext, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { Trans, useTranslation } from 'react-i18next';
import ErrorFallback from '../../components/ErrorFallback';
import LiteLoader from '../../components/Loaders/LiteLoader';
import Button from '../../components/Button';
import { CloseSign } from '../../icons';
import { RepositoriesContext } from '../../context/repositoriesContext';
import { RepoType, SyncStatus } from '../../types/general';
import { DeviceContext } from '../../context/deviceContext';
import AddRepos from './AddRepos';
import ReposSection from './ReposSection';
import AddRepoCard from './AddRepoCard';

const filterRepositories = (repos?: RepoType[]) => {
  return (
    repos?.filter(
      (r) =>
        r.sync_status !== SyncStatus.Uninitialized &&
        r.sync_status !== SyncStatus.Removed,
    ) || []
  );
};

const HomePage = () => {
  const { t } = useTranslation();
  const { fetchRepos, repositories } = useContext(RepositoriesContext);
  const { isSelfServe } = useContext(DeviceContext);
  const [popupOpen, setPopupOpen] = useState(false);
  const [addReposOpen, setAddReposOpen] = useState<
    null | 'local' | 'github' | 'public'
  >(null);
  const [reposToShow, setReposToShow] = useState<RepoType[]>(
    filterRepositories(repositories),
  );

  useEffect(() => {
    if (repositories) {
      setReposToShow(filterRepositories(repositories));
    }
  }, [repositories]);

  return (
    <div className="w-full flex flex-col mx-auto max-w-6.5xl">
      <div className="p-8 pb-0">
        <h4 className="mb-3">
          <Trans>Add</Trans>
        </h4>
        <div className="flex gap-3.5">
          <AddRepoCard type="github" onClick={setAddReposOpen} />
          <AddRepoCard type="public" onClick={setAddReposOpen} />
          {!isSelfServe && (
            <AddRepoCard type="local" onClick={setAddReposOpen} />
          )}
        </div>
      </div>
      <ReposSection
        reposToShow={reposToShow}
        setReposToShow={setReposToShow}
        repositories={repositories}
      />
      <AddRepos
        addRepos={addReposOpen}
        onClose={(isSubmitted) => {
          if (isSubmitted) {
            fetchRepos();
            setTimeout(() => fetchRepos(), 1000);
            setPopupOpen(true);
            setTimeout(() => setPopupOpen(false), 3000);
          }
          setAddReposOpen(null);
        }}
      />
      {popupOpen && (
        <div
          className={`fixed w-85 p-3 flex gap-3 bg-bg-shade border border-bg-border rounded-lg shadow-high left-8 bottom-24 z-40 text-bg-main`}
        >
          <LiteLoader />
          <div className="flex flex-col gap-1">
            <p className="body-s text-label-title">
              <Trans>Syncing repository</Trans>
            </p>
            <p className="caption text-label-base">
              <Trans>
                We are syncing your repository to bloop. This might take a
                couple of minutes
              </Trans>
            </p>
          </div>
          <Button
            variant="tertiary"
            size="tiny"
            onlyIcon
            title={t('Close')}
            onClick={() => setPopupOpen(false)}
          >
            <CloseSign />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sentry.withErrorBoundary(HomePage, {
  fallback: (props) => <ErrorFallback {...props} />,
});
