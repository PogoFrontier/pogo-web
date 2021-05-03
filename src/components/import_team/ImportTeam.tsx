import style from './ImportTeam.module.scss'
import Loader from 'react-loader-spinner'

interface ImportTeamProps {
  visible: boolean
  importString: string
  saveImportString: (input: any) => void
  cancelImport: () => void
  confirmImport: () => void
  isLoading: boolean
}

const ImportTeam: React.FC<ImportTeamProps> = ({
  visible,
  importString,
  saveImportString,
  cancelImport,
  confirmImport,
  isLoading,
}) => {
  return (
    <div
      className={style.importTeam}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <textarea
        placeholder="Paste your imported team here"
        onChange={saveImportString}
        value={importString}
      />
      <div className={style.importTeamButtons}>
        {isLoading ? (
          <Loader type="TailSpin" color="#68BFF5" height={30} width={30} />
        ) : (
          <button onClick={confirmImport} className="btn btn-primary">
            Import
          </button>
        )}

        <button onClick={cancelImport} className="btn btn-negative">
          Cancel
        </button>
      </div>
    </div>
  )
}
export default ImportTeam
