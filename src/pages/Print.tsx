import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ThumbnailCanvasAoVivo, AoVivoTemplate } from '@/components/ThumbnailCanvasAoVivo';
import { teamsAoVivo } from '@/data/teamsAoVivo';
import { teamsConferenceLeague } from '@/data/teamsConferenceLeague';

const Print = () => {
  const [searchParams] = useSearchParams();

  const timeA = searchParams.get('timeA') || '';
  const timeB = searchParams.get('timeB') || '';
  const competicao = (searchParams.get('competicao') || '').toLowerCase();

  const isConference = competicao.includes('conference');
  const aoVivoTemplate: AoVivoTemplate = isConference ? 'conferenceleague' : 'europaleague';
  const teams = isConference ? teamsConferenceLeague : teamsAoVivo;

  const findTeam = (name: string) => {
    const n = name.toUpperCase().trim();
    return teams.find(t => t.name.toUpperCase() === n)
      || teams.find(t => t.name.toUpperCase().includes(n))
      || teams.find(t => n.includes(t.name.toUpperCase()));
  };

  const homeTeam = useMemo(() => findTeam(timeA), [timeA, teams]);
  const awayTeam = useMemo(() => findTeam(timeB), [timeB, teams]);

  const matchData = useMemo(() => ({
    homeTeamId: homeTeam?.id || null,
    awayTeamId: awayTeam?.id || null,
    homeScore: 0,
    awayScore: 0,
    homeScoreSmall: 0,
    awayScoreSmall: 0,
    showSmallScore: false,
  }), [homeTeam, awayTeam]);

  const defaultTransform = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 };

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      overflow: 'hidden',
    }}>
      <div
        id="thumbnail-container"
        style={{
          width: '1280px',
          height: '720px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <ThumbnailCanvasAoVivo
          playerPhoto={null}
          photoTransform={defaultTransform}
          photoLeft={null}
          photoLeftTransform={defaultTransform}
          photoRight={null}
          photoRightTransform={defaultTransform}
          matchData={matchData}
          template="europaleague"
          aoVivoTemplate={aoVivoTemplate}
          gradientLeftColor="#000000"
          gradientRightColor="#000000"
          panelLeftColor="#000000"
          panelRightColor="#000000"
          showSomAmbiente={true}
        />
      </div>
    </div>
  );
};

export default Print;
