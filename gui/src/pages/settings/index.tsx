import { Button } from "@/components/ui/button";
import { useSettingsView } from "@/hooks/use-settings-view";
import { SettingSections } from "./setting-sections";

export default function Settings() {
  const {
    isSaveDisabled,
    handleSave,
    resetSettings,
    handleChange,
    settingsLocalState,
    resetState,
    setHostsPathDefault,
    setHostsPathCustom,
  } = useSettingsView();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <SettingSections
        handleChange={handleChange}
        settingsLocalState={settingsLocalState}
        resetState={resetState}
        setHostsPathDefault={setHostsPathDefault}
        setHostsPathCustom={setHostsPathCustom}
      />

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-3">
        <Button
          variant="subtle"
          size="sm"
          duration="lg"
          onClick={resetSettings}
        >
          Reset to defaults
        </Button>
        <Button
          variant="primary"
          size="sm"
          shadow="lg"
          duration="lg"
          disabled={isSaveDisabled}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
