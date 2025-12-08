import sys
from typing import List, Dict, Any

sys.path.insert(0, ".")

class TeamEngine:
    def __init__(self, team_data: List[Dict[str, Any]]):
        self.team_data = team_data

    def get_team_member(self, member_id: int) -> Dict[str, Any]:
        for member in self.team_data:
            if member.get('id') == member_id:
                return member
        return {}

    def add_team_member(self, member_info: Dict[str, Any]) -> None:
        if not any(member.get('id') == member_info.get('id') for member in self.team_data):
            self.team_data.append(member_info)

    def remove_team_member(self, member_id: int) -> bool:
        for i, member in enumerate(self.team_data):
            if member.get('id') == member_id:
                del self.team_data[i]
                return True
        return False

    def update_team_member(self, member_id: int, updates: Dict[str, Any]) -> bool:
        for member in self.team_data:
            if member.get('id') == member_id:
                member.update(updates)
                return True
        return False

    def list_team_members(self) -> List[Dict[str, Any]]:
        return self.team_data

# Example usage
if __name__ == "__main__":
    team_data = [
        {'id': 1, 'name': 'Alice', 'role': 'Developer'},
        {'id': 2, 'name': 'Bob', 'role': 'Designer'}
    ]

    engine = TeamEngine(team_data)
    print(engine.list_team_members())
    engine.add_team_member({'id': 3, 'name': 'Charlie', 'role': 'Manager'})
    print(engine.list_team_members())
    engine.update_team_member(2, {'role': 'Lead Designer'})
    print(engine.list_team_members())
    engine.remove_team_member(1)
    print(engine.list_team_members())