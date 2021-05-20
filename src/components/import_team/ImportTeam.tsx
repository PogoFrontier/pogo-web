import style from './ImportTeam.module.scss'
import Loader from 'react-loader-spinner'
import { useContext } from 'react'
import TranslationContext from '@context/TranslationContext'

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
  const strings = useContext(TranslationContext).strings

  return (
    <div
      className={style.importTeam}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <textarea
        placeholder={strings.paste_import_team}
        onChange={saveImportString}
        value={importString}
      />
      <div className={style.importTeamButtons}>
        {isLoading ? (
          <Loader type="TailSpin" color="#68BFF5" height={30} width={30} />
        ) : (
          <button onClick={confirmImport} className="btn btn-primary">
            {strings.import}
          </button>
        )}

        <button onClick={cancelImport} className="btn btn-negative">
          {strings.exit}
        </button>
      </div>
    </div>
  )
}
export default ImportTeam
