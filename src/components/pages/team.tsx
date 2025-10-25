"use client";

import { useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  Crown,
  TrendingUp,
  ArrowDownLeft,
  ArrowDownRight,
  Sparkles,
  Award,
  Network,
} from "lucide-react";

import { useTeam, TreeNode as TreeNodeData } from "@/store/team";

interface TreeNodeProps {
  name: string;
  userid: number | string;
  s_pv: number;
  l_pv: number;
  r_pv: number;
  isRoot?: boolean;
  refCode?: string;
  nodeData?: TreeNodeData;
  level?: number;
}

const TreeNode = ({
  name,
  userid,
  s_pv,
  l_pv,
  r_pv,
  isRoot,
  refCode,
  nodeData,
  level = 0,
}: TreeNodeProps) => {
  const hasChildren =
    nodeData?.children && (nodeData.children.left || nodeData.children.right);

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="flex flex-col items-center group">
        <div
          className={`relative ${
            isRoot
              ? "bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#B8860B] shadow-2xl shadow-[#D4AF37]/50"
              : ""
          } border-2 ${
            isRoot
              ? "border-[#D4AF37]"
              : "border-[#E5D5B7] hover:border-[#D4AF37]"
          } rounded-xl p-5 min-w-[220px] shadow-lg hover:shadow-2xl transition-all duration-300 transform `}
          style={
            !isRoot
              ? {
                  background:
                    "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
                }
              : undefined
          }
        >
          {isRoot && (
            <div className="absolute -top-3 -right-3">
              <Crown className="w-6 h-6 text-white animate-pulse drop-shadow-lg" />
            </div>
          )}
          <div
            className={`p-1.5 rounded-full w-fit mx-auto ${
              isRoot ? "bg-white/30" : "bg-[#D4AF37]/20"
            }`}
          >
            <Users
              className={`w-10 h-10 mx-1 my-1 ${
                isRoot ? "text-white" : "text-[#B8860B]"
              }`}
            />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p
                className={`${
                  isRoot
                    ? "text-white font-bold"
                    : "text-gray-800 font-semibold"
                } text-sm truncate max-w-[100px]`}
              >
                {name}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`${
                isRoot
                  ? "bg-white/90 hover:bg-white text-[#B8860B]"
                  : "bg-[#D4AF37]/90 hover:bg-[#D4AF37] text-white"
              } text-xs px-2 py-0.5`}
            >
              #{userid}
            </Badge>
          </div>

          {refCode && (
            <div
              className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg border ${
                isRoot
                  ? "bg-white/20 border-white/30"
                  : "bg-[#FFD700]/20 border-[#D4AF37]/30"
              }`}
            >
              <Sparkles
                className={`w-3 h-3 ${
                  isRoot ? "text-white" : "text-[#D4AF37]"
                }`}
              />
              <p
                className={`text-xs font-mono font-medium ${
                  isRoot ? "text-white" : "text-gray-700"
                }`}
              >
                {refCode}
              </p>
            </div>
          )}

          <div
            className={`grid grid-cols-3 gap-3 mt-3 pt-3 border-t ${
              isRoot ? "border-white/30" : "border-[#E5D5B7]"
            }`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Award
                  className={`w-3 h-3 ${
                    isRoot ? "text-white/80" : "text-gray-600"
                  }`}
                />
              </div>
              <p
                className={`text-[10px] uppercase tracking-wider mb-1 ${
                  isRoot ? "text-white/80" : "text-gray-600"
                }`}
              >
                Self
              </p>
              <p
                className={`font-bold text-sm ${
                  isRoot ? "text-white" : "text-gray-800"
                }`}
              >
                {new Intl.NumberFormat().format(s_pv)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ArrowDownLeft
                  className={`w-3 h-3 ${
                    isRoot ? "text-white/80" : "text-blue-600"
                  }`}
                />
              </div>
              <p
                className={`text-[10px] uppercase tracking-wider mb-1 ${
                  isRoot ? "text-white/80" : "text-gray-600"
                }`}
              >
                Left
              </p>
              <p
                className={`font-bold text-sm ${
                  isRoot ? "text-white" : "text-blue-600"
                }`}
              >
                {new Intl.NumberFormat().format(l_pv)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ArrowDownRight
                  className={`w-3 h-3 ${
                    isRoot ? "text-white/80" : "text-green-600"
                  }`}
                />
              </div>
              <p
                className={`text-[10px] uppercase tracking-wider mb-1 ${
                  isRoot ? "text-white/80" : "text-gray-600"
                }`}
              >
                Right
              </p>
              <p
                className={`font-bold text-sm ${
                  isRoot ? "text-white" : "text-green-600"
                }`}
              >
                {new Intl.NumberFormat().format(r_pv)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Render Children if they exist */}
      {hasChildren && (
        <div className="flex flex-col items-center w-full mt-8">
          {/* Connecting Lines */}
          <div className="relative w-full flex justify-center -mb-4">
            <div className="absolute top-0 left-1/2 w-0.5 h-10 bg-gradient-to-b from-[#D4AF37] to-[#B8860B] shadow-lg shadow-[#D4AF37]/30"></div>
            <div className="absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-[#D4AF37] to-green-500 shadow-lg shadow-[#D4AF37]/30"></div>
            {nodeData?.children?.left && (
              <div className="absolute top-10 left-1/4 w-0.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"></div>
            )}
            {nodeData?.children?.right && (
              <div className="absolute top-10 right-1/4 w-0.5 h-10 bg-gradient-to-b from-green-500 to-green-600 shadow-lg shadow-green-500/30"></div>
            )}
          </div>

          {/* Children Grid */}
          <div className="w-full grid grid-cols-2 gap-8 pt-20">
            {/* Left Child */}
            <div className="flex justify-center">
              {nodeData?.children?.left ? (
                <TreeNode
                  name={nodeData.children.left.firstname}
                  userid={nodeData.children.left.userid}
                  s_pv={nodeData.children.left.s_pv}
                  l_pv={nodeData.children.left.l_pv}
                  r_pv={nodeData.children.left.r_pv}
                  nodeData={nodeData.children.left}
                  level={level + 1}
                />
              ) : (
                <div
                  className="text-center text-gray-600 py-8 px-4 rounded-xl w-full max-w-[220px] border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
                  }}
                >
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                  <p className="text-xs font-medium">Empty</p>
                </div>
              )}
            </div>

            {/* Right Child */}
            <div className="flex justify-center">
              {nodeData?.children?.right ? (
                <TreeNode
                  name={nodeData.children.right.firstname}
                  userid={nodeData.children.right.userid}
                  s_pv={nodeData.children.right.s_pv}
                  l_pv={nodeData.children.right.l_pv}
                  r_pv={nodeData.children.right.r_pv}
                  nodeData={nodeData.children.right}
                  level={level + 1}
                />
              ) : (
                <div
                  className="text-center text-gray-600 py-8 px-4 rounded-xl w-full max-w-[220px] border-2 border-dashed border-green-300 hover:border-green-400 transition-colors"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
                  }}
                >
                  <Users className="w-8 h-8 mx-auto mb-2 text-green-300" />
                  <p className="text-xs font-medium">Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TeamPage() {
  const { teamData, loading, error, fetchTeamData } = useTeam();

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  if (loading) {
    return (
      <>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl shadow-lg">
              <Network className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
              My Team
            </h1>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-[#D4C5A0] to-transparent h-px mb-6 md:mb-8" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-[#E5D5B7]"
                style={{
                  background:
                    "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
                }}
              >
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-[#E5D5B7]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-[#E5D5B7]" />
                  <Skeleton className="h-4 w-3/4 bg-[#E5D5B7]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl shadow-lg">
              <Network className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
              My Team
            </h1>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-[#D4C5A0] to-transparent h-px mb-6 md:mb-8" />

        <Card
          className="border-red-300 border-2"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="text-center text-red-700">
              <p>Error loading team data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!teamData) {
    return (
      <>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl shadow-lg">
              <Network className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
              My Team
            </h1>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-[#D4C5A0] to-transparent h-px mb-6 md:mb-8" />

        <Card
          className="border-[#E5D5B7] border-2"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <p>No team data available</p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl shadow-lg shadow-[#D4AF37]/30">
            <Network className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
            My Team
          </h1>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-[#D4C5A0] to-transparent h-px mb-6 md:mb-8" />

      {/* Summary Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          className="border-2 border-[#E5D5B7] hover:border-[#D4AF37] transition-all duration-300 group"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-4 h-4 text-[#B8860B]" />
                  <p className="text-gray-600 text-xs uppercase tracking-wider">
                    Total Referrals
                  </p>
                </div>
                <p className="text-gray-800 text-3xl font-bold group-hover:text-[#D4AF37] transition-colors">
                  {teamData.total_referrals}
                </p>
              </div>
              <div className="p-3 bg-[#FFD700]/20 rounded-xl group-hover:bg-[#FFD700]/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-[#E5D5B7] hover:border-blue-400 transition-all duration-300 group"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                  <p className="text-gray-600 text-xs uppercase tracking-wider">
                    Left Team
                  </p>
                </div>
                <p className="text-gray-800 text-3xl font-bold group-hover:text-blue-600 transition-colors">
                  {teamData.children.left.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-[#E5D5B7] hover:border-green-400 transition-all duration-300 group"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-4 h-4 text-green-600" />
                  <p className="text-gray-600 text-xs uppercase tracking-wider">
                    Right Team
                  </p>
                </div>
                <p className="text-gray-800 text-3xl font-bold group-hover:text-green-600 transition-colors">
                  {teamData.children.right.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor & Upline Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card
          className="border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all duration-300"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
              <CardTitle className="text-gray-800 text-base">Sponsor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-gray-800 font-semibold text-lg">
                {teamData.sponsor.name}
              </p>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs px-3 py-1"
              >
                #{teamData.sponsor.userid}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all duration-300"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <CardTitle className="text-gray-800 text-base">Upline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-gray-800 font-semibold text-lg">
                {teamData.upline.name}
              </p>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs px-3 py-1"
              >
                #{teamData.upline.userid}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Binary Tree Visualization */}
      <Card
        className="transition-all duration-300 overflow-x-auto border-2 border-[#E5D5B7]"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)",
        }}
      >
        <CardHeader className="border-b-2 border-[#D4C5A0]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl">
              <Network className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-gray-800 text-xl">
              Binary Team Structure
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 overflow-x-auto">
          <div className="flex justify-center min-w-[800px]">
            {/* Recursive Tree Structure */}
            {teamData.tree ? (
              <TreeNode
                name={teamData.tree.firstname}
                userid={teamData.tree.userid}
                s_pv={teamData.tree.s_pv}
                l_pv={teamData.tree.l_pv}
                r_pv={teamData.tree.r_pv}
                isRoot={true}
                refCode={teamData.user.ref_code}
                nodeData={teamData.tree}
                level={0}
              />
            ) : (
              <div className="text-center text-gray-600 py-12">
                <p>No tree data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fff9f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #d4af37, #b8860b);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ffd700, #d4af37);
        }
      `}</style>
    </>
  );
}
