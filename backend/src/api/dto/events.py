from backend.src.api.dto.strictbasemodel import StrictBaseModel


class EventTracksCreateAPI(StrictBaseModel):
    name: str

class EventsCreateAPI(StrictBaseModel):
    name: str
    description: str
    start_date: str
    end_date: str
    event_tracks: list[EventTracksCreateAPI]
