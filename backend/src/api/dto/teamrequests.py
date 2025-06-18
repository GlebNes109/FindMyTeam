from backend.src.api.dto.strictbasemodel import StrictBaseModel


class TeamRequestsCreateAPI(StrictBaseModel):
    vacancy_id: str
    participant_id: str