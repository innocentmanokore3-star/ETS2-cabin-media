#include <windows.h>
#include <studio.h>
#include "scssdk.h"
#include "ets2_telemetry_common.h"
//structure shared between ETS2 DLL and Node.js backen
struct ETS2TelemetryData 
{
float speed, rpm, gear, fuel, cargoDamage, placementX, placementZ;
};
HANDLE hMapFile;
ETS2TelemetryData* sharedData = NULL;
//called by ETS2 when plugin loads
SCSAPI_RESULT scs_telemetry_init(const scs_u32_t version, const scs_telemetry_init_params_t* const params)
{
  //creating a shared memory Buffer named "ETS2_SHARED_MEM"
hMapFile = CreatFileMappingA(INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE, 0,sizeof(ETS2TelemetryData), "ETS2_SHARED_MEM");
if(hMapFile ==NULL) return SCS_RESULT_generic_error;
sharedData = (ETS2TelemetryData*)MapViewOfFile(hMapFile, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(ETS2TelemetryData));
if (sharedData == NULL) return SCS_RESULT_generic_error;

//register telemetry channels (speed, rpm, position, etc)
return SCS_RESULT_ok;
}
//callbak fired by ets2 engine every frame update
SCSAPI_VOID telemetry_frame_end (const scs_event_t event, const void* const event_info, const scs_context_t context)
{if (sharedData)
{
//read game state and write directly into shared memory
// sharedData->speedd = currentspeed;
//sharedData->placementx = posX;
//sharedData->placementZ =posZ;
}
}
