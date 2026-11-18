import { Back, Card, Heading, Screen } from '@/components/ui';
import { FeatureOverview } from '../components/FeatureOverview';
export default function ExploreScreen() {
  return (
    <Screen>
      <Back />
      <Heading
        title="Explore Forma"
        detail="Every feature is open to you. Your interests only shape the order of things on Home."
      />
      <Card>
        <FeatureOverview />
      </Card>
    </Screen>
  );
}
